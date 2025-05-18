import classNames from "classnames/bind";
import styles from "./Category.module.scss";
import Image from "~/components/Image";

const cx = classNames.bind(styles);

// eslint-disable-next-line react/prop-types
function Category({ src, name, description, ...props }) {


  return (
    <div className={cx("container")}  {...props}>
      <Image src={src} className={cx("categoryImage")} alt={`${name} icon`} />
      <div className={cx("wrapper")}>
        <div className={cx("Name")}>{name}</div>
        <div className={cx("Description")}>{description}</div>
      </div>
    </div>
  );
}

export default Category;
