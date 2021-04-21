import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Photo } from './photo';

@Entity()
export class Author {

   @PrimaryGeneratedColumn()
   id: number;

   @Column()
   name: string;

   @OneToMany(type => Photo, photo => photo.author) // note: we will create author property in the Photo class below
   photos: Photo[];
}