import s from "./Section.module.scss";

const Section = ({ title, subtitle, children }) => {
  return (
    <div>
      <h2 className={s.sectionTitle}>
        {title} <span>{subtitle}</span>
      </h2>
      {children}
    </div>
  );
};

export default Section;
