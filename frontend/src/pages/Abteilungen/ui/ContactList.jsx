import {
  MdPhone,
  MdPhoneAndroid,
  MdEmail,
  MdFax,
  MdAccessTime,
  MdOutlineStar,
  MdLocationOn,
} from "react-icons/md";

import s from "./ContactList.module.scss";

const ContactList = ({ data, keyProp, title1, title2, omitKeys }) => {
  const renderIcon = (tipe) => {
    switch (tipe) {
      case "phone":
        return (
          <div className={s.navIcon}>
            <MdPhone />
          </div>
        );
      case "mobile":
        return (
          <div className={s.navIcon}>
            <MdPhoneAndroid />
          </div>
        );
      case "email":
        return (
          <div className={s.navIcon}>
            <MdEmail />
          </div>
        );
      case "fax":
        return (
          <div className={s.navIcon}>
            <MdFax />
          </div>
        );
      case "working_hours":
        return (
          <div className={s.navIcon}>
            <MdAccessTime />
          </div>
        );
      case "speed_dial":
        return (
          <div className={s.navIcon}>
            <MdOutlineStar />
          </div>
        );
      case "city":
        return (
          <div className={s.navIcon}>
            <MdLocationOn />
          </div>
        );

      default:
        return <div></div>;
    }
  };
  return (
    <div className={s.grid}>
      {data.map((item) => {
        const usedKeys = [title1, title2, keyProp, ...omitKeys].filter(Boolean);
        const restEntries = Object.entries(item)
          .filter(([k, v]) => !usedKeys.includes(k))
          .filter(([_, v]) => v !== null && v !== undefined && v !== "")
          .map(([k, v]) => {
            const vStr = Array.isArray(v) ? v.join(",") : v;
            return [k, vStr];
          });
        return (
          <div key={item[keyProp]}>
            {title1 && <h2 className={s.title}>{item[title1]}</h2>}
            {title2 && <h5 className={s.title}>{item[title2]}</h5>}
            {restEntries.map(([k, v]) => (
              <div key={k} className={s.navIcons}>
                {renderIcon(k)}
                <div>{v}</div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default ContactList;
