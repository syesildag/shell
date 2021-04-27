import { GetServerSideProps } from 'next';
import Head from 'next/head';
import React from 'react';

import Layout from '../../components/layout';
import connect from '../../lib/src/typeorm/connection';
import { XmlTvProgram } from '../../lib/src/typeorm/entity/xmlTvProgram';
import { parseStringify } from '../../lib/src/utils/utils';
import utilStyles from '../../styles/utils.module.css';

export interface XmlTvProps {
   programs: Array<XmlTvProgram>;
}

export default class XmlTV extends React.Component<XmlTvProps>{

   constructor(props) {
      super(props);
   }

   render() {
      const { programs } = this.props;
      return (
         <Layout>
            <Head>
               <title>{"Guide Télé"}</title>
            </Head>
            <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
               <h2 className={utilStyles.headingLg}>Guide Télé</h2>
               <ul className={utilStyles.list}>
                  {programs.map((program) => (
                     <li className={utilStyles.listItem} key={program.id}>
                        {JSON.stringify(program.desc)}
                        <br />
                     </li>
                  ))}
               </ul>
            </section>
         </Layout>
      );
   }
}

export const getServerSideProps: GetServerSideProps<XmlTvProps> = async ({ params }) => {

   let connection = await connect();

   let repo = connection.getRepository(XmlTvProgram);

   let programs = await repo.find();

   programs = parseStringify(programs);

   return {
      props: {
         programs
      }
   };
}