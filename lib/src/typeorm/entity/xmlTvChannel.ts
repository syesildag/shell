import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

import { XmlTvProgram } from './xmlTvProgram';

@Entity()
export class XmlTvChannel {

   //<channel id="C2111.api.telerama.fr">
   //  <display-name>Franceinfo</display-name>
   //  <icon src="https://television.telerama.fr/sites/tr_master/files/sheet_media/tv/500x500/2111.png" />
   //</channel>

   @PrimaryColumn()
   id: string;

   @Column({ nullable: true })
   displayName: string;

   @Column({ nullable: true })
   icon: string;

   @OneToMany(type => XmlTvProgram, program => program.channel)
   programs: XmlTvProgram[];
}