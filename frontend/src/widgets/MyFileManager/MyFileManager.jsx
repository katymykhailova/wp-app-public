import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { FileManager } from "@cubone/react-file-manager";

import SearchForm from "@/shared/ui/SearchForm";

import {
  getSelectedFiles,
  useGetAllFilesQuery,
  useLazyGetPdfAuthorsQuery,
} from "@/store/services";
import { getFilesByCategory, selectFilteredFiles } from "@/store/selectors";

const MyFileManager = ({
  fileCategory,
  searchByTerm = true,
  authors = [],
  needAuthors = false,
}) => {
  const {
    data: categoryFiles = [],
    isLoading,
    isError,
  } = useGetAllFilesQuery(undefined, {
    selectFromResult: ({ data, isLoading, isError }) => ({
      isLoading,
      isError,
      data: getFilesByCategory(data, fileCategory, authors),
    }),
  });

  const hasFetchedAuthors = useRef(false);
  const [fetchAuthors] = useLazyGetPdfAuthorsQuery();
  useEffect(() => {
    if (!categoryFiles?.length || hasFetchedAuthors.current || !needAuthors)
      return;
    hasFetchedAuthors.current = true;

    const pdfFiles = categoryFiles.filter((f) => f.isPdf && !f.author);
    const batchSize = 50;
    for (let i = 0; i < pdfFiles.length; i += batchSize) {
      const batch = pdfFiles.slice(i, i + batchSize);
      setTimeout(() => {
        fetchAuthors(
          batch.map((f) => ({
            relativePath: f.relativePath,
            updatedAt: f.updatedAt,
            size: f.size,
          })),
        );
      }, i * 10);
    }
  }, [categoryFiles, fetchAuthors, needAuthors]);

  const lastClickTime = useRef(0);
  const [currentFolder, setCurrentFolder] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm] = useDebounce(searchTerm, 400);

  const filteredFiles = useMemo(
    () =>
      selectFilteredFiles(categoryFiles, debouncedTerm, authors, currentFolder),
    [categoryFiles, debouncedTerm, authors, currentFolder],
  );

  const handleFolderChange = async (folder) => {
    setCurrentFolder(folder);
  };

  const handleDownload = async (files) => {
    await getSelectedFiles(files);
  };

  const handleSelectionChange = useCallback(async (files) => {
    const file = files[0];
    if (file && file.isDirectory) return;
    const currentTime = new Date().getTime();
    if (currentTime - lastClickTime.current < 300) {
      await getSelectedFiles(files, "open");
      return;
    }
    lastClickTime.current = currentTime;
  }, []);

  return (
    <>
      {searchByTerm && categoryFiles.length > 0 && (
        <div>
          <p>
            Geben Sie zur Suche nach dem Formular den Suchbegriff ein. Sie
            können Ihre Suche einschränken, indem Sie eine oder mehrere
            Kategorien zum Durchsuchen auswählen. Wenn Sie das Formularfeld leer
            lassen können Sie sich auch alle Formulare der ausgewählten
            Kategorie(-n) anzeigen lassen
          </p>

          <SearchForm
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Suche"
          />
        </div>
      )}
      {categoryFiles.length > 0 && (
        <FileManager
          files={filteredFiles}
          language={"de-DE"}
          onDownload={handleDownload}
          onSelectionChange={handleSelectionChange}
          primaryColor="#f29400"
          enableFilePreview={false}
          onFolderChange={handleFolderChange}
          layout={"list"}
          permissions={{
            create: false,
            upload: false,
            move: false,
            copy: false,
            rename: false,
            delete: false,
          }}
        />
      )}
    </>
  );
};

export default MyFileManager;

//FileManager permissions = { create?: boolean; upload?: boolean; move?: boolean; copy?: boolean; rename?: boolean; download?: boolean; delete?: boolean; }
