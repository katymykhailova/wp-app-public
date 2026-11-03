import s from "./PostItem.module.scss";

const PostItem = ({ date, title, content }) => {
  return (
    <div className={s.postContent}>
      <h3 className={s.postTitle}>
        {date} | {title}
      </h3>
      <div
        className={s.postList}
        dangerouslySetInnerHTML={{ __html: content }}
      ></div>
    </div>
  );
};

export default PostItem;
