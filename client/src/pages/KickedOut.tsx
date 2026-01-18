const KickedOut = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#7765DA] to-[#4F0DCE] px-4 py-2 rounded-full inline-flex items-center gap-2">
            <span className="text-white font-semibold">⚡ Intervue Poll</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-[#373737] mb-4">
          You've been Kicked out !
        </h1>

        <p className="text-[#6E6E6E] text-lg">
          Looks like the teacher had removed you from the poll system. Please Try again sometime.
        </p>
      </div>
    </div>
  );
};

export default KickedOut;

