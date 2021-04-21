import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Country {

   @PrimaryColumn()
   id: number;

   @Column({
      length: 75
   })
   name: string;

   @Column("character", {
      length: 2
   })
   alpha_2: string;

   @Column("character", {
      length: 3
   })
   alpha_3: string;
}