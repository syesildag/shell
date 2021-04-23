import { GetServerSideProps } from 'next';
import Head from 'next/head';
import React from 'react';

import Layout from '../../../components/layout';
import connect from '../../../lib/src/typeorm/connection';
import { Country } from '../../../lib/src/typeorm/entity/country';
import logger from '../../../lib/src/utils/logger';
import { parseStringify } from '../../../lib/src/utils/utils';
import utilStyles from '../../../styles/utils.module.css';

export interface CountProps {
  country: Country
}

export default class Count extends React.Component<CountProps> {
  render() {
    const { country } = this.props;
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
}

export const getServerSideProps: GetServerSideProps<CountProps> = async ({ params }) => {

  let connection = await connect();

  logger.debug("connected with params: " + JSON.stringify(params));

  let repo = connection.getRepository(Country);

  let countries = await repo.findByIds([params.id]);

  let country = parseStringify(countries[0]);

  return {
    props: {
      country
    }
  };
}