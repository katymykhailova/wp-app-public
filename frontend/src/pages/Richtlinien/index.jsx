import { useState, useMemo } from "react";
import { useDebounce } from "use-debounce";

import Content from "@/layouts/Content";
import { PageLayoutProvider } from "@/layouts/PageLayoutProvider";
import { pagesConfig } from "@/shared/config/pages.config";

import MyFileManager from "@/widgets/MyFileManager";

import Inputlist from "@/shared/ui/Inputlist";

import s from "./ui/Richtlinien.module.scss";

const Richtlinien = () => {
  const config = pagesConfig["/richtlinien"];
  const initPolices = [
    { key: "personal", label: "Personal", checked: false, author: "personal" },
    { key: "fibu", label: "FiBu", checked: false, author: "fibu" },
    { key: "fuhrpark", label: "Fuhrpark", checked: false, author: "fuhrpark" },
    {
      key: "kundenservice",
      label: "Kundenservice",
      checked: false,
      author: "kundenservice",
    },
    { key: "it", label: "IT", checked: false, author: "it" },
    {
      key: "logistik",
      label: "Logistik, Lager",
      checked: false,
      author: "logistik",
    },
    {
      key: "onlineshop",
      label: "Onlineshop",
      checked: false,
      author: "onlineshop",
    },
    { key: "vertrieb", label: "Vertrieb", checked: false, author: "vertrieb" },
  ];
  const [polices, setPolices] = useState(initPolices);
  const selectedPolices = useMemo(
    () => polices.filter((p) => p.checked).map((p) => p.author),
    [polices],
  );
  const [debouncedPolices] = useDebounce(selectedPolices, 1000);

  const handleCheckboxChange = (key) => {
    setPolices((prev) =>
      prev.map((i) => (i.key === key ? { ...i, checked: !i.checked } : i)),
    );
  };

  return (
    <PageLayoutProvider config={config}>
      <Content>
        <h1>Richtlinien</h1>
        <div className={s.categoryTumb}>
          <h4>Kategorie</h4>
          <Inputlist checkList={polices} handleChange={handleCheckboxChange} />
        </div>
        <MyFileManager
          authors={debouncedPolices}
          fileCategory={"Richtlinien"}
          needAuthors={true}
        />
      </Content>
    </PageLayoutProvider>
  );
};

export default Richtlinien;
