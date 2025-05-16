#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "fifo.h"
#include "lru.h"
#include "optimal.h"
#include "second_chance.h"
#include "lfu.h"

int main(int argc, char *argv[]) {
    if (argc < 5) {
        printf("Usage: %s <frames> <num_pages> <page_sequence> <algorithm>\n", argv[0]);
        return 1;
    }

    int frames = atoi(argv[1]);
    int num_pages = atoi(argv[2]);
    char *page_sequence = argv[3];
    char *algorithm = argv[4];

    int pages[num_pages];
    char *token = strtok(page_sequence, " ");
    for (int i = 0; i < num_pages; i++) {
        if (token == NULL) {
            printf("Error: Not enough pages provided.\n");
            return 1;
        }
        pages[i] = atoi(token);
        token = strtok(NULL, " ");
    }

    int page_faults = 0;

    if (strcmp(algorithm, "FIFO") == 0) {
        page_faults = fifo(frames, pages, num_pages);
    } else if (strcmp(algorithm, "LRU") == 0) {
        page_faults = lru(frames, pages, num_pages);
    } else if (strcmp(algorithm, "OPTIMAL") == 0) {
        page_faults = optimal(frames, pages, num_pages);
    } else if (strcmp(algorithm, "second_chance") == 0) {
        page_faults = second_chance(pages, num_pages, frames);
    } else if (strcmp(algorithm, "LFU") == 0) {
    page_faults = lfu(frames, pages, num_pages);
    } else {
        printf("Invalid algorithm\n");
        return 1;
    }

    printf("Page faults: %d\n", page_faults);
    return 0;
}
