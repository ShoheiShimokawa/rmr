import { Divider } from "@mui/material"
export const BookDetail = ({ book }) => {
    return (
        <div className="flex">
            <div >
                <div className="flex">
                    <img src={book.thumbnail} />
                    <div>

                        <div className="text-xl"> {book.title}</div>
                        <div>authored by {book.author}</div>
                        <div>{book.genre}</div>
                        <div>published Date : {book.publishedDate ? book.publishedDate : "unknown"}</div>
                    </div>
                </div>
                <Divider sx={{ m: 0.5 }} />
                <div className="text-base font-sans">{book.description}</div>

            </div>
        </div>
    );
}