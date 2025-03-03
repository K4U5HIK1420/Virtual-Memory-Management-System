#include "fifo.h"
#include <stdio.h>
#include <stdlib.h>

int fifo(int frames, int pages[], int n) {
    int *memory = (int *)malloc(frames * sizeof(int));
    int page_faults = 0;
    int index = 0;

    for (int i = 0; i < frames; i++) {
        memory[i] = -1; // Initialize memory frames
    }

    for (int i = 0; i < n; i++) {
        int page = pages[i];
        int found = 0;

        // Check if page is already in memory
        for (int j = 0; j < frames; j++) {
            if (memory[j] == page) {
                found = 1;
                break;
            }
        }

        // If page is not in memory, replace the oldest page
        if (!found) {
            memory[index] = page;
            index = (index + 1) % frames; // Circular queue for FIFO
            page_faults++;
        }
    }

    free(memory);
    return page_faults;
}