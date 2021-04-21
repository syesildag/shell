import { Column, Entity, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Album } from './album';
import { Author } from './author';
import { PhotoMetadata } from './photoMetadata';

@Entity()
export class Photo {

   @PrimaryGeneratedColumn()
   id: number;

   @Column({
      length: 100
   })
   name: string;

   @Column("text")
   description: string;

   @Column()
   filename: string;

   @Column("double precision")
   views: number;

   @Column()
   isPublished: boolean;

   @OneToOne(type => PhotoMetadata, photoMetadata => photoMetadata.photo, {
      cascade: true
   })
   metadata: PhotoMetadata;

   @ManyToOne(type => Author, author => author.photos)
   author: Author;

   @ManyToMany(type => Album, album => album.photos)
   albums: Album[];
}