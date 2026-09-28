import React from "react";
import { Profile } from "./Profile";
import { getPostAllByUser, getGoodPostAll } from "../api/post";
import { BookShelf } from "./book/BookShelf";
import { Post } from "./Post";
import { useContext } from "react";
import UserContext from "./UserProvider";
import { getByHandle } from "../api/account";
import { useState, useEffect, useCallback } from "react";
import { Divider, Tabs, Tab, Box, CircularProgress } from "@mui/material";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { RiBookShelfFill, RiBookShelfLine } from "react-icons/ri";
import { BsChatSquareQuote, BsChatSquareQuoteFill } from "react-icons/bs";
import { useParams, useSearchParams } from "react-router-dom";
import { useNotify } from "../hooks/NotifyProvider";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ProfileHighlights } from "./highlight/ProfileHighlights";

export const UserPage = () => {
  const { handle } = useParams();
  const [searchParams] = useSearchParams();
  const [account, setAccount] = useState();
  const { user } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [goodPostIds, setGoodPostIds] = useState([]);
  const { notify } = useNotify();
  // Quotesは本人だけの引用なので、他人のプロフィールではタブごと出さない。
  const isOwner = !!user && user.handle === handle;

  const find = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getByHandle(handle);
      setAccount(result.data);
      const postResult = await getPostAllByUser(
        result.data.userId && result.data.userId
      );

      const sortedPosts = postResult.data.slice().sort((a, b) => {
        const dateA = a.registerDate ? new Date(a.registerDate).getTime() : 0;
        const dateB = b.registerDate ? new Date(b.registerDate).getTime() : 0;
        return dateB - dateA;
      });
      setPosts(sortedPosts);
      if (user) {
        const goodList = await getGoodPostAll(user.userId);
        const likedIds = goodList.data.map((g) => g.post.postId);
        setGoodPostIds(likedIds);
      }
    } catch (error) {
      notify("Failed to Loading.", "error");
    } finally {
      setLoading(false);
    }
  }, [handle, notify, user]);
  useEffect(() => {
    find();
  }, [find]);

  const TabPanel = ({ children, value, index }) => {
    return (
      <div hidden={value !== index}>
        {value === index && <Box p={1}>{children}</Box>}
      </div>
    );
  };

  const displayName = account?.name || account?.handle;
  const bio = account?.description || `${displayName}さんの読書記録`;
  // SNSでシェアされた際の説明文にのみ公式ハッシュタグを付ける
  const shareBio = `${bio} #ReadMyReads`;

  const postsContent = loading ? (
    <div className="flex justify-center items-center min-h-[300px]">
      <CircularProgress />
    </div>
  ) : posts.length !== 0 ? (
    <div className="space-y-1">
      {posts.map((post) => (
        <React.Fragment key={post.postId}>
          <Post
            post={post}
            visible={true}
            isInitiallyGooded={goodPostIds.includes(post.postId)}
          />
          {posts.length > 1 && <Divider />}
        </React.Fragment>
      ))}
    </div>
  ) : (
    <div className="font-soft flex justify-center text-zinc-500 dark:text-zinc-400">
      No Posts yet.
    </div>
  );

  const tabDefs = [
    {
      key: "bookshelf",
      label: "Shelf",
      iconFilled: <RiBookShelfFill size={18} />,
      iconOutlined: <RiBookShelfLine size={18} />,
      content: account && <BookShelf account={account} />,
    },
    {
      key: "posts",
      label: "Posts",
      iconFilled: <DescriptionRoundedIcon sx={{ fontSize: 18 }} />,
      iconOutlined: <DescriptionOutlinedIcon sx={{ fontSize: 18 }} />,
      content: postsContent,
    },
    // Quotesは本人だけの引用なので、自分のプロフィールを見ているときだけタブに出す。
    ...(isOwner
      ? [
          {
            key: "highlights",
            label: "Quotes",
            iconFilled: <BsChatSquareQuoteFill size={16} />,
            iconOutlined: <BsChatSquareQuote size={16} />,
            content: account && <ProfileHighlights account={account} />,
          },
        ]
      : []),
  ];

  const [tabIndex, setTabIndex] = useState(() => {
    const index = tabDefs.findIndex((tab) => tab.key === searchParams.get("tab"));
    return index >= 0 ? index : 0;
  });

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  return (
    <div>
      {account && (
        <Helmet>
          <title>{`${displayName}(@${account.handle})の本棚 | ReadMyReads`}</title>
          <meta name="description" content={bio} />
          <meta
            property="og:title"
            content={`${displayName}(@${account.handle})の本棚`}
          />
          <meta property="og:description" content={shareBio} />
          <meta
            property="og:image"
            content={`${window.location.origin}/api/og?handle=${encodeURIComponent(
              account.handle
            )}`}
          />
          <meta property="og:url" content={window.location.href} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:description" content={shareBio} />
        </Helmet>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 1,
            p: 2,
          }}
        >
          {account && <Profile userId={account.userId} />}
          <Divider />
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            className="mb-4"
            textColor="inherit"
            TabIndicatorProps={{ style: { backgroundColor: "currentColor" } }}
          >
            {tabDefs.map((tab, index) => (
              <Tab
                key={tab.key}
                icon={index === tabIndex ? tab.iconFilled : tab.iconOutlined}
                iconPosition="start"
                label={tab.label}
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  fontFamily: "'Nunito sans'",
                  minHeight: 48,
                }}
              />
            ))}
          </Tabs>
          {tabDefs.map((tab, index) => (
            <TabPanel key={tab.key} value={tabIndex} index={index}>
              {tab.content}
            </TabPanel>
          ))}
        </Box>
      </motion.div>
    </div>
  );
};
