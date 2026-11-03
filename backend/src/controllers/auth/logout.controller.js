import sendSuccessRes from "../../_helpers/sendSuccessRes.js";

export default async (req, res) => {
  try {
    res.clearCookie("token", {
      httponly: true,
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });
    sendSuccessRes(res, { message: "is logout" }, 204);
  } catch (error) {
    sendSuccessRes(res, { message: error.message }, 500);
  }
};
