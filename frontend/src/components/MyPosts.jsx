import { getPostAllByUser } from "../api/post";
import { useContext,useState, useEffect } from "react";
import UserContext from './UserProvider';
import { Avatar,Card, CardContent, Tooltip, Box ,Divider} from '@mui/material';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';

export const MyPosts =()=>{
    const { user } = useContext(UserContext);
    const [posts,setPosts] =useState([]);
    const find =async()=>{
        const result = await getPostAllByUser(user.userId);
        console.log(result)
        console.log("ueue!!")
        setPosts(result.data);
        console.log(posts)
    }
    useEffect(()=>{
        find();
    },[]);
    return(
        <div>
             <div className="container mx-auto space-y-3">
                {posts && 
                <>
                {posts.map((post) => (
                   <Card key={post.postId} sx={{ maxWidth: 800 }}  >
                      <CardContent>
                        <div className="flex">
                      <Avatar src={user.picture} className="mr-2"/>
                        <div>
                        <div>{post.name}</div>
                        <div>{post.handle}</div>
                        </div>
                      </div>
                        <div className="flex gap-6">
                            {post.reading &&
                            <>
                            <div className="space-y-2">
                             <div className="mt-2">{post.reading.thoughts}</div>
                             {/* <div>{judgeRead(book)}</div> */}
                        
                             <div className="flex">
                             <Box component="img" src={post.reading.book.thumbnail} />
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
    );
}