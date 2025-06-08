import XIcon from "@mui/icons-material/X";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

export const Information = () => {
  return (
    <div>
      <br></br>
      <div className="text-4xl font-soft font-bold">ReadMyReads is ...</div>
      <br></br>
      <div className="text-xl font-soft">
        ReadMyReads, or rmr, is your personal reading hub — simple, honest, and
        shareable.
      </div>
      <br></br>
      <div className="text-xl font-soft">
        Create your own digital bookshelf, share your favorite books, and
        capture the phrases that moved you.
      </div>
      <br></br>
      <div className="text-xl font-soft">
        {" "}
        We believe reading connects us — not only to ideas, but to each other.
      </div>
      <br></br>
      <div className="text-xl font-soft">
        On rmr, you can recommend books you truly love, write honest
        reflections, and discover what others are reading too.
      </div>
      <br></br>
      <div className="text-xl font-soft">Let your shelf speak for you.</div>
      <div className="text-xl font-soft">
        And let others say, "I want to read your reads."
      </div>
      <div>
        <div className="font-soft mb-3 mt-5 text-3xl font-bold">
          Contact us here:
        </div>
        <div className=" font-soft mt-3 mb-3">
          We want to make this service even better, so if you find any glitches
          or feature requests, please don't hesitate to contact us.{" "}
        </div>
        <div className="flex items-center">
          <XIcon fontSize="small" />
          <div className="font-soft ml-2">@ReadMyReads</div>
        </div>
        <div className="flex items-center mt-1">
          <MailOutlineIcon fontSize="small" />{" "}
          <div className="font-soft ml-2">readmyreads@gmail.com</div>
        </div>
      </div>

      <br></br>
      <br></br>

      <div className="text-3xl font-soft font-bold">
        {" "}
        📚So, Let's read more books!
      </div>
    </div>
  );
};
