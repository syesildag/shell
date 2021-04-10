import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Photo } from './photo';

@Entity()
export class Album {

   @PrimaryGeneratedColumn()
   id: number;

   @Column()
   name: string;

   @ManyToMany(type => Photo, photo => photo.albums)
   @JoinTable()
   photos: Photo[];
}