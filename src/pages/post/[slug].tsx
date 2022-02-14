import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';
import Prismic from '@prismicio/client';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  navigation: {
    prevPost: {
      uid: string;
      data: {
        title: string;
      };
    }[];
    nextPost: {
      uid: string;
      data: {
        title: string;
      };
    }[]
  };
  preview: boolean;
}
//talvez colocar o :JSX.Element
export default function Post({ post }: PostProps) {
  const totalWords = post.data.content.reduce((total, contentItem) => {
    total += contentItem.heading.split(' ').length;
    
    const words = contentItem.body.map(item => item.text.split(' ').length);
    words.map(word => (total += word));

    return total;
  }, 0 );

  const readTime = Math.ceil(totalWords / 200 );

  const router = useRouter();
  if(router.isFallback) {
    return <h1>Carregando...</h1>;
  };

  const formatedDate = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR,
    } 
  )

  return (
    <>
      <Head>
        <title>{`${post.data.title} | spaceTraveling` }</title>
      </Head>
      <Header/>
      <img src={post.data.banner.url} alt="imagem" className={styles.banner} />
      <main className={commonStyles.container}>
        <div className={styles.post}>
          <div className={styles.postTop}>
            <h1>{post.data.title}</h1>
            <ul>
              <li>
                <FiCalendar/>
                {formatedDate}
              </li>

              <li>
                <FiUser/>
                {post.data.author}
              </li>

              <li>
                <FiClock/> 
                {`${readTime} min`}
              </li>
            </ul>
          </div>
          {post.data.content.map(content => {
            return (
              <article key={content.heading}> 
              <h2>{content.heading}</h2>
              <div
                className={styles.postContent}
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body)
                }}
              />
            </article>
            )
          })}
        </div>

      </main>
    </>

  )
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      }
    }
  })

  return { 
    paths,
    fallback: true,
  }

  // TODO
};

export const getStaticProps = async context => {
  const prismic = getPrismicClient();
  const {slug} = context.params;
  const response = await prismic.getByUID('posts', String(slug),{});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          header: content.heading,
          body: [...content.body],

        }
      })
    }
  }
  return { 
    props: {
      props: {
        post
      }
    }
  }
};
