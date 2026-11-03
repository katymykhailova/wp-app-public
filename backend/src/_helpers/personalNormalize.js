import { v4 as uuidv4 } from "uuid";
import fsPromises from "fs/promises";
import data from "../../db_daten/personal2.json" with { type: "json" };
import tours from "../../db_daten/tours.json" with { type: "json" };
// const personal = data.flatMap((dept) => {
//   const { contactPersons, subdepartments = [], ...cleanDept } = dept;
//   const topContacts = (contactPersons ?? []).map((person) => ({
//     ...person,
//     ...cleanDept,
//   }));

//   const subContacts = subdepartments.flatMap((sub) => {
//     const { contactPersons: subPersons, ...cleanSub } = sub;

//     return (subPersons ?? []).map((person) => ({
//       ...person,
//       ...cleanSub,
//       parentDepartment: dept.department,
//     }));
//   });
//   return [...topContacts, ...subContacts];
// });

// const personalProperties = [...new Set(personal.flatMap(Object.keys))];
// const personalNormalized = personal.map((o) => {
//   const base = Object.fromEntries(
//     personalProperties.map((k) => [k, o[k] ?? null])
//   );
//   return { id: uuidv4(), ...base };
// });

for (const i of tours) {
  data.push({
    id: null,
    user_id: null,
    name: i.name,
    jobTitle: null,
    jobTitle2: null,
    phone: null,
    ext: null,
    mobile: i.mobile,
    speed_dial: i.speed_dial,
    email: null,
    fax: null,
    department: ["Touren"],
    parent_department: "Touren",
    division: ["Touren"],
    working_hours: null,
    hotlinenummer: null,
    ofice_working_hours: null,
    hotline: null,
    city: i.name?.slice(0, i.name?.indexOf(" ")),
  });
}

// const newData = tours.forEach((i) => {
// });

const personalNormalized = data.map((i) => {
  // const regex = /(?<=intern:\s*)\d+/;
  // const str = i.phone;
  // const ext = str ? str.match(regex) || [] : [];
  // delete i.address;
  const normalized = {
    ...i,
    id: uuidv4(),
    // user_id: i.user_id,
    // name: i.name,
    // jobTitle: i.jobTitle,
    // jobTitle2: i.jobTitle2,
    // phone: i.phone,
    // ext: i.ext,
    // mobile: i.mobile,
    // speed_dial: i.speed_dial,
    // email: i.email,
    // fax: i.fax,
    // department: i.department,
    // parent_department: i.parent_department,
    // division: i.division,
    // working_hours: i.working_hours,
    // hotlinenummer: i.hotlinenummer,
    // ofice_working_hours: i.ofice_working_hours,
    // hotline: i.hotline,
    // city: i.city,
    // id: uuidv4(),
    // speed_dial: i.speed_dial || null,
    // ext: ext[0] || null,
    // division: i.division || i.department,
  };
  // if (normalized.parentDepartment) delete normalized.parentDepartment;
  // if (normalized.workingHours) delete normalized.workingHours;
  // if (normalized.Bürozeiten) delete normalized.Bürozeiten;

  return normalized;
});

await fsPromises
  .writeFile(
    "../../db_daten/personal.json",
    JSON.stringify(personalNormalized, null, 2),
    (err) => {
      if (err) console.log(err);
    },
  )
  .then();
