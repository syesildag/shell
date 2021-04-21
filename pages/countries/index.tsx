import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import Layout from '../../components/layout';
import connect from '../../lib/src/typeorm/connection';
import { Country } from '../../lib/src/typeorm/entity/country';
import utilStyles from '../../styles/utils.module.css';

export default function Countries({ countries }: InferGetServerSidePropsType<typeof getServerSideProps>) {
   return (
      <Layout home>
         <Head>
            <title>{"Countries"}</title>
         </Head>
         <section className={utilStyles.headingMd}>
            <p>[Self Introduction]</p>
            <p>
               (This is a sample website - you’ll be building a site like this in{' '}
               <a href="https://nextjs.org/learn">our Next.js tutorial</a>.)
            </p>
         </section>
         <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
            <h2 className={utilStyles.headingLg}>Blog</h2>
            <ul className={utilStyles.list}>
               {countries.map(({ id, name }) => (
                  <li className={utilStyles.listItem} key={id}>
                     <Link href={`/countries/country/${id}`}>
                        <a>{id + ' - ' + name}</a>
                     </Link>
                     <br />
                  </li>
               ))}
            </ul>
         </section>
      </Layout>
   );
}

export const getServerSideProps: GetServerSideProps<{ countries: Country[] }> = async ({ params }) => {

   let connection = await connect();

   let repo = connection.getRepository(Country);

   let countries = await repo.find();

   countries = JSON.parse(JSON.stringify(countries));

   return {
      props: {
         countries
      }
   };
}