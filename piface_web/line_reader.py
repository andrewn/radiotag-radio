class LineReader:
  def __init__(self):
    self.buffer = ""

  def push(self, str):
    self.buffer += str

  def process(self):
    parts = self.buffer.split('\n')
    print "Found parts: " + str(len(parts))

    if len(parts) > 1:
      print "Setting buffer to " + str(parts[-1:])
      self.buffer = ''.join(parts[-1:])
      return parts [:-1]
    else:
      print 'doing nothing'