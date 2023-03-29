import React from "react";
import Image from "next/image";
import { FaUserAlt, FaRegImage, FaUserEdit } from "react-icons/fa";
import Link from "next/link";

//INTERNAL IMPORT
import Style from "./Profile.module.css";
import images from "../../../img";

const Profile = ({ currentAccount }) => {
  return (
    <div className={Style.profile}>
      <div className={Style.profile_account}>
        <Image
          src={images.user1}
          alt="user profile"
          width={50}
          height={50}
          className={Style.profile_account_img}
        />

        <div className={Style.profile_account_info}>
          <p>Wye Rock</p>
          <small>{currentAccount.slice(0, 18)}..</small>
        </div>
      </div>

      <div className={Style.profile_menu}>
        <div className={Style.profile_menu_one}>
          <div className={Style.profile_menu_one_item}>
            <FaUserAlt />
            <p>
              <Link href={{ pathname: "/author" }}>My Profile</Link>
            </p>
          </div>
          <div className={Style.profile_menu_one_item}>
            <FaRegImage />
            <p>
              <Link href={{ pathname: "/author" }}>My Items</Link>
            </p>
          </div>
         
        </div>

        <div className={Style.profile_menu_two}>
          
        </div>
      </div>
    </div>
  );
};

export default Profile;