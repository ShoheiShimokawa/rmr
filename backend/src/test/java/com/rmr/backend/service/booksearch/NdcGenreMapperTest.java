package com.rmr.backend.service.booksearch;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

class NdcGenreMapperTest {

    @Test
    void mapsRepresentativeClasses() {
        assertEquals("Business & Economics", NdcGenreMapper.toGenreLabel("332.107"));
        assertEquals("Fiction", NdcGenreMapper.toGenreLabel("913.6"));
        assertEquals("Poetry", NdcGenreMapper.toGenreLabel("911.56"));
        assertEquals("Literary Criticism", NdcGenreMapper.toGenreLabel("910.268"));
        assertEquals("Psychology", NdcGenreMapper.toGenreLabel("146.1"));
        assertEquals("Self-Help", NdcGenreMapper.toGenreLabel("159"));
        assertEquals("Computers", NdcGenreMapper.toGenreLabel("007.64"));
        assertEquals("Comics & Graphic Novels", NdcGenreMapper.toGenreLabel("726.1"));
        assertEquals("Cooking", NdcGenreMapper.toGenreLabel("596.21"));
        assertEquals("Health & Fitness", NdcGenreMapper.toGenreLabel("498.3"));
        assertEquals("History", NdcGenreMapper.toGenreLabel("210.5"));
        assertEquals("Travel", NdcGenreMapper.toGenreLabel("291.09"));
        assertEquals("Foreign Language Study", NdcGenreMapper.toGenreLabel("837.8"));
        assertEquals("Language Arts & Disciplines", NdcGenreMapper.toGenreLabel("816"));
    }

    @Test
    void mapsJuvenilePrefix() {
        assertEquals("Juvenile Fiction", NdcGenreMapper.toGenreLabel("K913"));
        assertEquals("Juvenile Nonfiction", NdcGenreMapper.toGenreLabel("K480"));
    }

    @Test
    void returnsNullForUnparseableCodes() {
        assertNull(NdcGenreMapper.toGenreLabel(null));
        assertNull(NdcGenreMapper.toGenreLabel(""));
        assertNull(NdcGenreMapper.toGenreLabel("+"));
        assertNull(NdcGenreMapper.toGenreLabel("9"));
    }
}
