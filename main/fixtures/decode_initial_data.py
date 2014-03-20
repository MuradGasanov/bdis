__author__ = 'murad'

open("initial_data.json", "wb").write(open("initial_data.js").read().decode("unicode_escape").encode("utf8"))
print "decode complete"