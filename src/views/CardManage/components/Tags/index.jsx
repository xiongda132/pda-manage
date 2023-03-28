import { WithContext as ReactTags } from "react-tag-input";

export default ({ index, tags, addTag, deleteTag, clickTag }) => {
  const handleTagClick = (index) => {
    clickTag(index);
  };

  const handleDelete = (i) => {
    deleteTag(i, index);
  };

  const handleAddition = (tag) => {
    addTag(tag, index);
  };

  return (
    <>
      <ReactTags
        tags={tags}
        handleDelete={handleDelete}
        handleAddition={handleAddition}
        handleTagClick={handleTagClick}
        inputFieldPosition="bottom"
        placeholder="请扫描"
        autofocus={false}
      ></ReactTags>
    </>
  );
};
