import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import { XmlTvChannel } from './xmlTvChannel';

@Entity()
export class XmlTvProgram {

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

   @PrimaryColumn()
   id: string;

   @ManyToOne(type => XmlTvChannel, channel => channel.programs)
   channel: XmlTvChannel;

   @Column()
   start: Date;

   @Column()
   stop: Date;

   @Column({ nullable: true })
   title: string;

   @Column({nullable: true})
   desc: string;

   @Column({ nullable: true })
   category: string;

   @Column({ nullable: true })
   icon: string;
}