#include "base_util.h"
#include "clogan_core.h"
#include <stdio.h>
#include <time.h>

int main(int argc, const char **argv) {
  char key[16] = "0123456789012345";
  char iv[16] = "0123456789012345";
  int code;

  clogan_debug(0);
  code = clogan_init("log", "log", 10 * 1024 * 1024, key, iv);
  printf("[init]: %d\n", code);

  code = clogan_open("logan.bin");
  printf("[open]: %d\n", code);

  long long ts = get_system_current_clogan();
  time_t now = time(NULL);
  char *now_str = ctime(&now);
  printf("[now]: %s\n", now_str);

  clogan_flush();
  clogan_write(10, now_str, ts, "main", 1, 1);
  clogan_write(10, "[log 1]", ts++, "main", 1, 1);
  clogan_write(10, "[log 2]", ts++, "main", 1, 1);
  clogan_write(10, "[log 3]", ts++, "main", 1, 1);
  clogan_write(10, "[log 4]", ts++, "main", 1, 1);
  clogan_write(10, "[log 5]", ts++, "main", 1, 1);
  clogan_write(10, "how", ts++, "main", 1, 1);
  clogan_write(10, "are", ts++, "main", 1, 1);
  clogan_write(10, "you", ts++, "main", 1, 1);
  clogan_write(10, "fine", ts++, "main", 1, 1);
  //  clogan_flush();

  printf("[exit]\n");
}
