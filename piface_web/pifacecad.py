from event import Event

IODIR_RISING_EDGE = 1
IODIR_FALLING_EDGE = 2

def singleton(class_):
  instances = {}
  def getinstance(*args, **kwargs):
    if class_ not in instances:
        instances[class_] = class_(*args, **kwargs)
    return instances[class_]
  return getinstance

@singleton
class LCD:
  def __init__(self):
    self.lines = [''] * 2
    self.current_line = 0

  def write(self, text):
    print 'writing ' + text
    self.lines[self.current_line] = text

  def set_cursor(self, pos, line):
    self.current_line = line

  def blink_off(self):
    print "blink off"

  def cursor_off(self):
    print "cursor off"

  def backlight_on(self):
    print "backlight on"

  def backlight_off(self):
    print "backlight off"

  def clear(self):
    self.lines = [''] * 2

class InterruptEvent:
  def __init__(self, pin_num):
    self.pin_num = pin_num

@singleton
class SwitchEventListener:
  def __init__(self, chip=None):
    self.events = [Event()] * 9

  def register(self, button, edge=None, handler=None):
    print "register " + str(button)
    self.events[button] += handler

  def activate(self):
    print "activated"

class PiFaceCAD:
  def __init__(self):
    self.SwitchEventListener = SwitchEventListener
    self.lcd = LCD()
