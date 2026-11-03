import s from "./Footer.module.scss";

const Footer = () => {
  return (
    <footer className={s.footer}>
      <h1 className={s.footerTitle}>So will ich leben</h1>
      <p className={s.footerText}>
        Die Weitergabe von Inhalten dieses Informationssystems in schriftlicher,
        mündlicher oder elektronischer Form an Dritte ist untersagt und führt zu
        arbeitsrechtlichen Konsequenzen.
      </p>
    </footer>
  );
};

export default Footer;
