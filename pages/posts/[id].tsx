import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import React from 'react';

import { PostData } from '..';
import Date from '../../components/date';
import Layout from '../../components/layout';
import { getAllPostIds, getPostData } from '../../lib/src/posts';
import utilStyles from '../../styles/utils.module.css';

export interface PostProps {
  postData: PostData
}

export default class Post extends React.Component<PostProps>{
  render() {
    const { postData } = this.props;
    return (
      <Layout>
        <Head>
          <title>{postData.title}</title>
        </Head>
        <article>
          <h1 className={utilStyles.headingXl}>{postData.title}</h1>
          <div className={utilStyles.lightText}>
            <Date dateString={postData.date} />
          </div>
          <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
        </article>
      </Layout>
    );
  }
}

export const getStaticPaths: GetStaticPaths<PostData> = async () => {
  const paths = getAllPostIds();
  return {
    paths,
    fallback: false
  };
}

export const getStaticProps: GetStaticProps<PostProps> = async ({ params }) => {
  const postData = await getPostData(params.id as string);
  return {
    props: {
      postData
    }
  };
}