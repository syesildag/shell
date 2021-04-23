import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';

import Layout from '../../components/layout';
import connect from '../../lib/src/typeorm/connection';
import { Country } from '../../lib/src/typeorm/entity/country';
import { parseStringify } from '../../lib/src/utils/utils';
import utilStyles from '../../styles/utils.module.css';

export interface CountriesProps {
   countries: Array<Country>;
}

export default class Countries extends React.Component<CountriesProps>{

   constructor(props) {
      super(props);
   }

   render() {
      const { countries } = this.props;
      return (
         <Layout>
            <Head>
               <title>{"Countries"}</title>
            </Head>
            <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
               <h2 className={utilStyles.headingLg}>Countries</h2>
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
}

export const getServerSideProps: GetServerSideProps<CountriesProps> = async ({ params }) => {

   let connection = await connect();

   let repo = connection.getRepository(Country);

   let countries = await repo.find();

   countries = parseStringify(countries);

   return {
      props: {
         countries
      }
   };
}