import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';

import Date from '../../components/date';
import Layout from '../../components/layout';
import { getSortedPostsData, PostData } from '../../lib/src/posts';
import utilStyles from '../../styles/utils.module.css';

export interface PostsProps {
   posts: Array<PostData>;
}

export default class Posts extends React.Component<PostsProps>{

   constructor(props) {
      super(props);
   }

   render() {
      const { posts } = this.props;
      return (
         <Layout>
            <Head>
               <title>{"Posts"}</title>
            </Head>
            <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
               <h2 className={utilStyles.headingLg}>Blog</h2>
               <ul className={utilStyles.list}>
                  {posts.map(({ id, date, title }) => (
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
}

export const getStaticProps: GetStaticProps<PostsProps> = async () => {
   const posts = getSortedPostsData();
   return {
      props: {
         posts
      }
   };
}