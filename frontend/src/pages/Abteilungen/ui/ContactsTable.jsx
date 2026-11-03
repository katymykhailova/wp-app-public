import clsx from "clsx";
import { useWindowWidth } from "@/shared/hooks";

import s from "./ContactsTable.module.scss";

const ContactsTable = ({ personal = [], selectedDivision = "" }) => {
  const normalizePersonal = personal
    .filter((i) => !i?.name?.toLowerCase().includes("tba"))
    .map((i) => {
      const openingParenIndex = i.name?.indexOf("(");
      const normalizeName =
        openingParenIndex >= 0 ? i.name?.slice(0, openingParenIndex) : i.name;
      return { ...i, name: normalizeName };
    });

  const windowWidth = useWindowWidth();
  const big = windowWidth >= 1440;
  const middle = windowWidth < 1440 && windowWidth >= 720;
  const small = windowWidth < 720;
  const threeColumns = selectedDivision === "Touren";
  const tableHead =
    selectedDivision === "Touren"
      ? ["Name", "Kurzwahl", "Mobil"]
      : [
          "Vorname Name",
          "Bereich/Position",
          "Durchwahl",
          "Kurzwahl",
          "Mobil",
          "E- Mail",
        ];

  const renderPersonalSection = (data) => (
    <>
      {(big || threeColumns) &&
        data.map((i, index) => (
          <div className={s.contactListItem} key={index}>
            {i}
          </div>
        ))}
      {middle && (
        <>
          <div className={s.contactListItem}>{data[0]}</div>
          <div className={s.contactListItem}>{data[1]}</div>
          <div className={s.contactListItem}>
            <div>{data[2]}</div>
            <div>{data[3]}</div>
          </div>
          <div className={s.contactListItem}>
            <div>{data[4]}</div>
            <div>{data[5]}</div>
          </div>
        </>
      )}
      {small && (
        <>
          <div className={s.contactListItem}>
            <div>{data[0]}</div>
            <div>
              {data[1]?.length > 21 ? data[1].slice(0, 20) + "." : data[1]}
            </div>
          </div>
          <div className={s.contactListItem}>
            <div>{data[2]}</div>
            <div>{data[3]}</div>
          </div>
          <div className={s.contactListItem}>
            <div>{data[4]}</div>
            <div>{data[5]}</div>
          </div>
        </>
      )}
    </>
  );

  return (
    <>
      <h4>Telefonverzeichnis</h4>
      <div
        className={clsx(s.contactListContainer, s.title, {
          [s.big]: big,
          [s.middle]: middle,
          [s.small]: small || threeColumns,
        })}
      >
        {renderPersonalSection(tableHead)}
      </div>
      {normalizePersonal?.length > 0 &&
        normalizePersonal.map((i) => (
          <div
            className={clsx(s.contactListContainer, {
              [s.big]: big,
              [s.middle]: middle,
              [s.small]: small || threeColumns,
            })}
            key={i.id}
          >
            {renderPersonalSection(
              threeColumns
                ? [i.name || "", i.speed_dial || "", i.mobile || ""]
                : [
                    i.name || "",
                    `${i?.city[0]} / ${i.jobTitle}`,
                    i.ext || "",
                    i.speed_dial || "",
                    i.mobile || "",
                    i.email || "",
                  ],
            )}
          </div>
        ))}
    </>
  );
};
export default ContactsTable;
