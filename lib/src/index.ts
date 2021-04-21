import { config, grep, ls, pwd, ShellString } from 'shelljs';

import connect from './typeorm/connection';
import { Album } from './typeorm/entity/album';
import { Author } from './typeorm/entity/author';
import { Country } from './typeorm/entity/country';
import { Photo } from './typeorm/entity/photo';
import { PhotoMetadata } from './typeorm/entity/photoMetadata';
import logger from './utils/logger';

config.verbose = true;

let present: ShellString = pwd();

logger.info(present.stdout);

let list = ls(`-A`);

logger.info(list.grep('tsconfig').stdout);

let result = grep(`-l`, /config/gi, "src/index*");

result.stdout.split('\n').forEach(file => {
   if (file) {
      let result = grep(/config/gi, file);
      logger.info(result.stdout);
   }
});

connect().then(async connection => {

   logger.warn("connected!");

   let entityMetadatas = connection.entityMetadatas;
   logger.warn(`tableNames:`);
   for (const entityMetadata of entityMetadatas) {
      logger.warn(`-> ${entityMetadata.tableName}`);
      if (entityMetadata.tableName !== "country" && entityMetadata.name !== Author.name) {
         logger.warn(`--> clearing table ${entityMetadata.tableName}`);
         const repository = connection.getRepository(entityMetadata.name);
         await repository.delete({});
      }
   }

   logger.warn(`--> clearing table ${Author.name}`);
   const repository = connection.getRepository(Author);
   await repository.delete({});

   let crepo = connection.getRepository(Country);
   let turkey = await crepo
      .createQueryBuilder("country") // first argument is an alias. Alias is what you are selecting - photos. You must specify it.
      .where("country.name = :countryName")
      .setParameters({ countryName: "Turkey" })
      .getOne();

   logger.warn(JSON.stringify(turkey));

   // create a few albums
   let album1 = new Album();
   album1.name = "Bears";
   await connection.manager.save(album1);

   let album2 = new Album();
   album2.name = "Me";
   await connection.manager.save(album2);

   let author = new Author();
   author.name = "Serkan YESILDAG";
   await connection.manager.save(author);

   let repo = connection.getRepository(Photo);

   let photo = new Photo();
   photo.name = "Me and Bears";
   photo.description = "I am near polar bears";
   photo.filename = "photo-with-bears.jpg";
   photo.views = 1;
   photo.isPublished = true;
   photo.author = author;
   photo.albums = [album1, album2];

   // create photo metadata object
   let metadata = new PhotoMetadata();
   metadata.height = 640;
   metadata.width = 480;
   metadata.compressed = true;
   metadata.comment = "cybershoot";
   metadata.orientation = "portrait";

   photo.metadata = metadata; // this way we connect them

   let savedPhoto = await repo.save(photo);
   logger.warn("Photo has been saved. Photo id is", savedPhoto.id);
   logger.warn("exiting!");
   process.exit(0);
}).catch(error => logger.error(error));

logger.warn("finish!");

//sendEmail({ ...testMailOptions, text: 'cronu job', html: '<h3>Cronu Job</h3>' });