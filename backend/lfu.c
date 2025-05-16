#include "lfu.h"
#include <stdio.h>
#include <stdlib.h>

int lfu(int frames, int pages[], int n) {
    int *memory = (int *)malloc(frames * sizeof(int));
    int *frequency = (int *)malloc(frames * sizeof(int));
    int *time_stamp = (int *)malloc(frames * sizeof(int)); // For tie-breaking using age
    int page_faults = 0;

    for (int i = 0; i < frames; i++) {
        memory[i] = -1;
        frequency[i] = 0;
        time_stamp[i] = 0;
    }

    for (int i = 0; i < n; i++) {
        int page = pages[i];
        int found = 0;

        // Check if the page is already in memory
        for (int j = 0; j < frames; j++) {
            if (memory[j] == page) {
                frequency[j]++;
                time_stamp[j] = i + 1; // Update time to break ties
                found = 1;
                break;
            }
        }

        // If page not found, replace the least frequently used one
        if (!found) {
            int lfu_index = -1;

            // Find an empty slot first
            for (int j = 0; j < frames; j++) {
                if (memory[j] == -1) {
                    lfu_index = j;
                    break;
                }
            }

            // No empty slot found, find LFU with oldest timestamp
            if (lfu_index == -1) {
                lfu_index = 0;
                for (int j = 1; j < frames; j++) {
                    if (frequency[j] < frequency[lfu_index]) {
                        lfu_index = j;
                    } else if (frequency[j] == frequency[lfu_index] &&
                               time_stamp[j] < time_stamp[lfu_index]) {
                        lfu_index = j;
                    }
                }
            }

            memory[lfu_index] = page;
            frequency[lfu_index] = 1;
            time_stamp[lfu_index] = i + 1;
            page_faults++;
        }
    }

    free(memory);
    free(frequency);
    free(time_stamp);
    return page_faults;
}