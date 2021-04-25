import { Job } from 'bullmq';
import fetch from 'node-fetch';
import { parseString } from 'xml2js';

import sendEmail, { testMailOptions } from '../../../mailer/nodemailer';
import connect from '../../../typeorm/connection';
import { XmlTvChannel } from '../../../typeorm/entity/xmlTvChannel';
import { XmlTvProgram } from '../../../typeorm/entity/xmlTvProgram';
import logger from '../../../utils/logger';
import { JobDataType } from '../../jobs';
import { JobName, JobProcessor } from '../../queue';

export const URL = "https://xmltv.ch/xmltv/xmltv-tnt.xml";

//<channel id="C4.api.telerama.fr">
//  <display-name>France 2</display-name>
//  <icon src="https://television.telerama.fr/sites/tr_master/files/sheet_media/tv/500x500/4.png" />
//</channel>

export interface Channel {
   $: { id: string };
   "display-name": string[];
   icon: Array<{ $: { src: string } }>;
}

//<programme start="20210425013500 +0200" stop="20210425014000 +0200" channel="C4.api.telerama.fr">
//  <title>Météo 2</title>
//  <desc lang="fr">Le point, plusieurs fois par jour, sur l'évolution de la météo, grâce à des cartes et des explications.</desc>
//  <category lang="fr">météo</category>
//  <length units="minutes">5</length>
//  <icon src="https://television.telerama.fr/sites/tr_master/files/sheet_media/media/5b584e5bb489f1f40b295bafe4eb4d3bfc485213.jpg" />
//  <rating system="CSA">
//    <value>Tout public</value>
//  </rating>
//</programme>

export interface Program {
   $: { start: string, stop: string, channel: string };
   title: string[];
   desc: Array<{ _: string }>;
   category: Array<{ _: string }>;
   icon: Array<{ $: { src: string } }>;
}

export interface Tv {
   channel: Channel[];
   programme: Program[];
}

export interface Result {
   tv: Tv
}

export default class XmlTvTask implements JobProcessor {
   supply(): JobDataType {
      return 'xmlTv';
   }
   process(job: Job<JobDataType, void, JobName>): Promise<void> {
      logger.debug(`running XmlTvTask job ${JSON.stringify(job)}`);
      fetch(URL)
         .then(async response => {
            const text = await response.text();
            parseString(text, async (e, result: Result) => {
               let connection = await connect();
               for (const channel of result.tv.channel) {
                  let tvChannel = new XmlTvChannel();
                  tvChannel.displayName = channel['display-name']?.[0];
                  tvChannel.icon = channel.icon?.[0]?.$?.src;
                  tvChannel.id = channel.$.id;
                  await connection.manager.save(tvChannel);
               }

               let repo = connection.getRepository(XmlTvChannel);
               var reggie = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/;

               for (const program of result.tv.programme) {
                  let tvProgram = new XmlTvProgram();
                  tvProgram.category = program.category?.[0]?._;
                  let channel = program.$.channel;
                  tvProgram.channel = await repo.findOne(channel);
                  tvProgram.desc = program.desc?.[0]?._;
                  tvProgram.icon = program.icon?.[0]?.$?.src;
                  tvProgram.title = program.title?.[0];
                  var startDateArray = reggie.exec(program.$.start);
                  var startDate = new Date(
                     (+startDateArray[1]),
                     (+startDateArray[2]) - 1, // Careful, month starts at 0!
                     (+startDateArray[3]),
                     (+startDateArray[4]),
                     (+startDateArray[5]),
                     (+startDateArray[6])
                  );
                  tvProgram.start = startDate;
                  var stopDateArray = reggie.exec(program.$.stop);
                  var stopDate = new Date(
                     (+stopDateArray[1]),
                     (+stopDateArray[2]) - 1, // Careful, month starts at 0!
                     (+stopDateArray[3]),
                     (+stopDateArray[4]),
                     (+stopDateArray[5]),
                     (+stopDateArray[6])
                  );
                  tvProgram.stop = stopDate;
                  tvProgram.id = [channel, startDate.toJSON(), stopDate.toJSON()].join("_");
                  await connection.manager.save(tvProgram);
               }
               sendEmail({ ...testMailOptions, subject: 'XmlTV', text: 'fetched xmltv', html: '<h3>Fetched XmlTV</h3>' });
            });
         })
         .catch(e => {
            logger.error(e);
         });
      return;
   }
}