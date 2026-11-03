import { api } from "@/shared/api";
import { baseApi } from "@/store/api/baseApi";

export const fileSystemAPI = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllFiles: builder.query({
      query: (params) => ({
        url: "/fileSystem",
        params,
      }),
      providesTags: ["FileSystem"],
      keepUnusedDataFor: 600,
    }),
    getPdfAuthors: builder.query({
      query: (paths) => ({
        url: "/fileSystem/pdf-authors",
        method: "POST",
        body: { paths },
      }),
      providesTags: ["FileSystemPDF"],
      keepUnusedDataFor: 300,
      async onQueryStarted(paths, { dispatch, queryFulfilled }) {
        try {
          const { data: authorsData } = await queryFulfilled;

          dispatch(
            baseApi.util.updateQueryData("getAllFiles", undefined, (draft) => {
              const authorsByPath = new Map(
                authorsData.map((f) => [f.relativePath, f.author]),
              );

              draft.forEach((file) => {
                if (authorsByPath.has(file.relativePath)) {
                  file.author = authorsByPath.get(file.relativePath);
                }
              });
            }),
          );
        } catch (error) {
          console.error("Failed to fetch PDF authors:", error);
        }
      },
    }),
  }),
});

export const getSelectedFiles = async (data, actionType = "download") => {
  let files = data;
  if (data.length === 0) return;
  if (data.length === 1) files = data[0];

  if (data.length === 1 && actionType === "open" && data[0].isPdf) {
    getFileDirectly(data[0], actionType);
    return;
  }

  await downloadSelectedFiles(files, actionType);
};

const getFileDirectly = (file, actionType = "download") => {
  const fileUrl =
    `${import.meta.env.VITE_API_BASE_URL}/fileSystem/open?` +
    new URLSearchParams({ path: file.relativePath, action: actionType });

  window.open(fileUrl, "_blank");
};

const downloadSelectedFiles = async (files, actionType = "download") => {
  try {
    const response = await api.post(
      `/fileSystem/download`,
      { files },
      {
        responseType: "blob",
        withCredentials: true,
      },
    );

    const contentDisposition = response.headers["content-disposition"];
    let filename = "download";

    if (contentDisposition) {
      const filenameStarMatch = contentDisposition.match(
        /filename\*=UTF-8''(.+?)(?:;|$)/i,
      );
      if (filenameStarMatch) {
        filename = decodeURIComponent(filenameStarMatch[1]);
      } else {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
    }

    const blob = response.data;
    const url = window.URL.createObjectURL(blob);
    if (actionType === "open" && blob.type === "application/pdf") {
      window.open(url, "_blank");
    } else {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }

    return { success: true };
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
};

export const {
  useGetAllFilesQuery,
  useGetPdfAuthorsQuery,
  useLazyGetPdfAuthorsQuery,
} = fileSystemAPI;
