import Head from 'next/head';
import Link from 'next/link';
import React from 'react';

import Layout, { siteTitle } from '../components/layout';
import { PostData } from '../lib/src/posts';
import utilStyles from '../styles/utils.module.css';

export interface HomeProps {
  allPostsData: Array<PostData>
}

export default class Home extends React.Component<HomeProps> {

  constructor(props) {
    super(props);
  }

  render() {
    const { allPostsData } = this.props;
    return (
      <Layout home>
        <Head>
          <title>{siteTitle}</title>
        </Head>
        <section className={utilStyles.headingMd}>
          <p>
            List of {' '}
            <Link href={`/countries`}>
              <a>{"Countries"}</a>
            </Link>
          </p>
        </section>
        <section className={utilStyles.headingMd}>
          <p>
            List of {' '}
            <Link href={`/posts`}>
              <a>{"Posts"}</a>
            </Link>
          </p>
        </section>
      </Layout>
    );
  }
}