import PostItem from "@/widgets/Posts/PostItem";
import s from "./PostList.module.scss";

const PostList = ({ news }) => {
  if (!news.length) {
    return <div>Keine Nachrichten gefunden!</div>;
  }
  return (
    <div className={s.postList}>
      {news.map((post) => (
        <PostItem
          key={post.id}
          date={post.date}
          title={post.title}
          content={post.content}
        ></PostItem>
      ))}
    </div>
  );
};

export default PostList;
