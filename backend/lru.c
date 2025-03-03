#include "lru.h"
#include <stdio.h>
#include <stdlib.h>

int lru(int frames, int pages[], int n) {
    int *memory = (int *)malloc(frames * sizeof(int));
    int *recently_used = (int *)malloc(frames * sizeof(int));
    int page_faults = 0;

    for (int i = 0; i < frames; i++) {
        memory[i] = -1; // Initialize memory frames
        recently_used[i] = 0; // Initialize recently used counter
    }

    for (int i = 0; i < n; i++) {
        int page = pages[i];
        int found = 0;

        // Check if page is already in memory
        for (int j = 0; j < frames; j++) {
            if (memory[j] == page) {
                found = 1;
                recently_used[j] = i + 1; // Update recently used counter
                break;
            }
        }

        // If page is not in memory, replace the least recently used page
        if (!found) {
            int lru_index = 0;
            for (int j = 1; j < frames; j++) {
                if (recently_used[j] < recently_used[lru_index]) {
                    lru_index = j;
                }
            }
            memory[lru_index] = page;
            recently_used[lru_index] = i + 1; // Update recently used counter
            page_faults++;
        }
    }

    free(memory);
    free(recently_used);
    return page_faults;
}