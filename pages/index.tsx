import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import Date from '../components/date';
import Layout, { siteTitle } from '../components/layout';
import { getSortedPostsData } from '../lib/src/posts';
import utilStyles from '../styles/utils.module.css';

export default function Home({
  allPostsData
}: {
  allPostsData: {
    date: string,
    title: string,
    id: string
  }[]
}) {
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
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, title }) => (
            <li className={utilStyles.listItem} key={id}>
              <Link href={`/posts/${id}`}>
                <a>{title}</a>
              </Link>
              <br />
              <small className={utilStyles.lightText}>
                <Date dateString={date} />
              </small>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData
    }
  };
}