import { useState, useCallback, useRef } from "react";
import clsx from "clsx";

import { useClickOutside } from "@/shared/hooks";
import Dropdown from "@/shared/ui/Dropdown/Dropdown";

import s from "./Suppliers.module.scss";
import ContactsTable from "./ContactList";

const Suppliers = ({
  suppliers,
  selectedSupplier,
  omitKeys,
  handleSuppliersChange,
}) => {
  const [current, setCurrent] = useState("Wählen Sie einen Lieferanten:");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const handleSelect = (item) => {
    setCurrent(item.lieferant);
    handleSuppliersChange?.(item.id);
    setIsOpen(false);
  };

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useClickOutside([dropdownRef, buttonRef], isOpen, handleClose);

  return (
    <>
      {suppliers.length > 0 && (
        <div className={s.actions}>
          <Dropdown
            placeholder={current}
            isOpen={isOpen}
            onToggle={handleToggle}
            dropdownRef={dropdownRef}
            buttonRef={buttonRef}
          >
            <Dropdown.List
              items={suppliers}
              field="lieferant"
              keyField="id"
              onClick={handleSelect}
            ></Dropdown.List>
          </Dropdown>
        </div>
      )}
      {selectedSupplier.length > 0 && (
        <ContactsTable
          data={selectedSupplier}
          keyProp={"id"}
          title1={"title"}
          title2={"name"}
          omitKeys={omitKeys}
        />
      )}
    </>
  );
};

export default Suppliers;
