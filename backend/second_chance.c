#include <stdio.h>
#include "second_chance.h"

#define MAX 100

int second_chance(int pages[], int n, int frames) {
    int queue[MAX], ref_bit[MAX];
    int pointer = 0;
    int page_faults = 0, i, j, found;

    for (i = 0; i < frames; i++) {
        queue[i] = -1;
        ref_bit[i] = 0;
    }

    for (i = 0; i < n; i++) {
        found = 0;

        for (j = 0; j < frames; j++) {
            if (queue[j] == pages[i]) {
                ref_bit[j] = 1;
                found = 1;
                break;
            }
        }

        if (!found) {
            while (1) {
                if (ref_bit[pointer] == 0) {
                    queue[pointer] = pages[i];
                    ref_bit[pointer] = 1;
                    pointer = (pointer + 1) % frames;
                    break;
                } else {
                    ref_bit[pointer] = 0;
                    pointer = (pointer + 1) % frames;
                }
            }
            page_faults++;
        }

        // Debug output (optional)
        printf("Step %d: ", i + 1);
        for (j = 0; j < frames; j++) {
            if (queue[j] != -1)
                printf("%d ", queue[j]);
            else
                printf("- ");
        }
        printf("\n");
    }

    return page_faults;
}
