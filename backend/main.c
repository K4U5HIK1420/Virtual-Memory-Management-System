#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "fifo.h"
#include "lru.h"
#include "optimal.h"

int main(int argc, char *argv[]) {
    if (argc < 5) {
        printf("Usage: %s <frames> <num_pages> <page_sequence> <algorithm>\n", argv[0]);
        return 1;
    }

    int frames = atoi(argv[1]);
    int num_pages = atoi(argv[2]);
    char *page_sequence = argv[3];
    char *algorithm = argv[4];

    // Convert page_sequence string to an array of integers
    int pages[num_pages];
    char *token = strtok(page_sequence, " ");
    for (int i = 0; i < num_pages; i++) {
        pages[i] = atoi(token);
        token = strtok(NULL, " ");
    }

    // Call the appropriate algorithm
    int page_faults = 0;
    if (strcmp(algorithm, "FIFO") == 0) {
        page_faults = fifo(frames, pages, num_pages);
    } else if (strcmp(algorithm, "LRU") == 0) {
        page_faults = lru(frames, pages, num_pages);
    } else if (strcmp(algorithm, "OPTIMAL") == 0) {
        page_faults = optimal(frames, pages, num_pages);
    } else {
        printf("Invalid algorithm\n");
        return 1;
    }

    // Output the result
    printf("Page faults: %d\n", page_faults);
    return 0;
}