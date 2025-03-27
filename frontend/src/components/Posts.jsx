import { useContext ,useEffect,useState} from "react";
import { getPostAll } from "../api/post";
import { Link } from "react-router-dom";
import {registerReading} from "../api/reading"
import { Avatar,Card, CardContent, Tooltip, Box ,Divider,IconButton} from '@mui/material';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';

export const Posts =({})=>{
    const [posts,setPosts] =useState([]);
    const find =async()=>{
        const result = await getPostAll();
        console.log(result)
        setPosts(result.data);
    }

    
    useEffect(()=>{
        find();
    },[]);
    return(
        <div>
            <div >
            <IconButton component={Link} to="/PostRegister">
            <PostAddRoundedIcon />
            </IconButton>
            </div>
            <div className="container mx-auto space-y-3">
                {posts && 
                <>
                {posts.map((post) => (
                   <Card key={post.postId} sx={{ maxWidth: 800 }}  >
                      <CardContent>
                        <div className="flex">
                      <Avatar src={post.user.picture} className="mr-2"/>
                        <div>
                        <div>{post.user.name}</div>
                        <div>{post.user.handle}</div>
                        </div>
                      </div>
                        <div className="flex gap-6">
                            {post.reading &&
                            <>
                            <div className="space-y-2">
                             <div className="mt-2 mb-4">{post.reading.thoughts}</div>
                             {/* <div>{judgeRead(book)}</div> */}
                        
                             <div className="flex">
                             <Box component="img" sx={{ width: "20%", height: "auto" }} src={post.reading.book.thumbnail} />
                             <div className="ml-2">
                             <div>{post.reading.book.title}</div>
                             <div >{post.reading.book.author}</div>
                             </div>
                            </div>
                            <FavoriteBorderRoundedIcon /> <div>いいね数をここに表示</div>
                         </div>
                            </>
                            }
                        </div>
                    </CardContent>
                   </Card>
                ))}
                </>
            }
             </div>
        </div>
    )
}