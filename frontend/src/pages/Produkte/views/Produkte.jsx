import Content from "@/layouts/Content";
import MyFileManager from "@/widgets/MyFileManager";
import { useParams } from "react-router-dom";

// Daten/Sortimentsdaten/Preislisten
// Daten/Sortimentsdaten/Skizzen

const Produkte = () => {
  const { product: productParam } = useParams();
  const fileCategories = {
    produkte: { category: "Sortimentsdaten", title: "Produkte & Preise" },
    lagerbestaende: {
      category: "Lagerware",
      title: "Lagerbestaende & Kataloge",
    },
    preislisten: { category: "Preislisten", title: "Preislisten " },
    rabattstaffel: { category: "Rabattstaffel", title: "Rabattstaffel" },
    salesnews: { category: "Sales News", title: "Sales News" },
    sonderedition: { category: "Sonderedition", title: "Sonderedition" },
    skizzen: { category: "Skizzen", title: "Skizzen" },
  };
  return (
    <Content>
      <h1>{fileCategories[productParam]?.title}</h1>
      <MyFileManager fileCategory={fileCategories[productParam]?.category} />
    </Content>
  );
};

export default Produkte;
