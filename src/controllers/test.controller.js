exports.getTest = (req, res) => {
  res.render('index', { title: 'Chat App Stage 0', message: 'Server is running âœ…' });
};
