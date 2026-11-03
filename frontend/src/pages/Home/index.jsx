import { Link } from "react-router-dom";

import Content from "@/layouts/Content";
import { PageLayoutProvider } from "@/layouts/PageLayoutProvider";
import { pagesConfig } from "@/shared/config/pages.config";
import Section from "@/shared/ui/Section/Section";
import PostList from "@/widgets/Posts";
import telefonVerzeichnis from "@/assets/verzeichnis.png";

import { useGetAllNewsQuery } from "@/store/services";
import s from "./ui/Home.module.scss";

const Home = () => {
  const config = pagesConfig["/"];

  const { data: news } = useGetAllNewsQuery(undefined, {
    selectFromResult: ({ data, isLoading, isError }) => {
      const list = data ?? [];
      return { isLoading, isError, data: list.slice(0, 2) };
    },
  });

  return (
    <PageLayoutProvider config={config}>
      <Content>
        <div className={s.popular}>
          <div className={s.popularContacts}>
            <Link to="/abteilungen">
              <span className={s.popularContactsTitle}>
                Telefon<span>verzeichnis</span>
              </span>
              <img
                src={telefonVerzeichnis}
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Link>
          </div>

          <nav className={s.breadcrumbNav}>
            <ul className={s.breadcrumb}>
              <li className={s.breadcrumbItem}>
                <Link to="/produkte" className={s.breadcrumbLink}>
                  <span>
                    Sales
                    <span className={s.accent}>News</span>
                  </span>
                  <span className={s.arrow}>&#9658;</span>
                </Link>
              </li>
              <li className={s.breadcrumbItem}>
                <Link to="/formulare" className={s.breadcrumbLink}>
                  <span>
                    Formulare <span className={s.accent}>& Anträge</span>
                  </span>
                  <span className={s.arrow}>&#9658;</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <Section
          title="Last News"
          subtitle="wichtige Infos für alle Mitarbeiter"
        >
          {news?.length && <PostList news={news}></PostList>}
        </Section>
      </Content>
    </PageLayoutProvider>
  );
};

export default Home;
