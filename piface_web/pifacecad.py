from event import Event

IODIR_RISING_EDGE = 1

def singleton(class_):
  instances = {}
  def getinstance(*args, **kwargs):
    if class_ not in instances:
        instances[class_] = class_(*args, **kwargs)
    return instances[class_]
  return getinstance

@singleton
class SwitchEventListener:
  def __init__(self, chip=None):
    print "hi"
    self.events = [Event()] * 9

  def register(self, button, edge=None, handler=None):
    print "register " + str(button)
    self.events[button] += handler

  def activate(self):
    print "activated"

class PiFaceCAD:
  def __init__(self):
    self.SwitchEventListener = SwitchEventListener
