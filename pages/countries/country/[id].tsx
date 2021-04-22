import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';

import Layout from '../../../components/layout';
import connect from '../../../lib/src/typeorm/connection';
import { Country } from '../../../lib/src/typeorm/entity/country';
import logger from '../../../lib/src/utils/logger';
import utilStyles from '../../../styles/utils.module.css';

export default function Count({ country }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Layout>
      <Head>
        <title>{country.name}</title>
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{country.id}</h1>
        <div>{JSON.stringify(country)}</div>
      </article>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<{ country: Country }> = async ({ params }) => {

  let connection = await connect();

  logger.debug("connected with params: " + JSON.stringify(params));

  let repo = connection.getRepository(Country);

  let countries = await repo.findByIds([params.id]);

  let country = JSON.parse(JSON.stringify(countries[0]));

  return {
    props: {
      country
    }
  };
}