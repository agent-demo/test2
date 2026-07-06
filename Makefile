##
# toradora
#
# @file
# @version 0.1.0

CC = gcc
CFLAGS = -Wall -Wextra -std=c99
LDLIBS = -l sqlite3
TARGET = toradora
SRC = toradora.c

.PHONY: all clean install uninstall

all: $(TARGET)

$(TARGET): $(SRC)
	$(CC) $(CFLAGS) $(SRC) -o $(TARGET) $(LDLIBS)

clean:
	rm -rf $(TARGET)

install: $(TARGET)
	install -Dm755 $(TARGET) $(HOME)/.local/bin/$(TARGET)

uninstall:
	rm $(HOME)/.toradora.db $(HOME)/.local/bin/$(TARGET)

# end
