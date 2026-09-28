package com.rmr.backend.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.context.LabelRepository;
import com.rmr.backend.model.Label.LabelView;

class LabelTest {

	@Test
	void findOrRegisterReturnsTheExistingLabelWithoutCreatingANewOne() {
		LabelRepository rep = mock(LabelRepository.class);
		AccountRepository aRep = mock(AccountRepository.class);
		Label existing = Label.builder().labelId(1).label("work").build();
		when(rep.findFirstByUserUserIdAndLabelOrderByLabelIdAsc(2, "work")).thenReturn(Optional.of(existing));

		Label result = Label.findOrRegister(rep, aRep, 2, "work");

		assertThat(result).isSameAs(existing);
		verifyNoInteractions(aRep);
		verify(rep, never()).save(any());
	}

	@Test
	void findOrRegisterCreatesANewLabelWhenNoneExistsYet() {
		LabelRepository rep = mock(LabelRepository.class);
		AccountRepository aRep = mock(AccountRepository.class);
		Account user = Account.builder().userId(2).build();
		when(rep.findFirstByUserUserIdAndLabelOrderByLabelIdAsc(2, "work")).thenReturn(Optional.empty());
		when(aRep.findById(2)).thenReturn(Optional.of(user));
		when(rep.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

		Label result = Label.findOrRegister(rep, aRep, 2, "work");

		assertThat(result.getLabel()).isEqualTo("work");
		assertThat(result.getUser()).isEqualTo(user);
	}

	@Test
	void viewOfReturnsNullForABlankLabelName() {
		assertThat(LabelView.viewOf(Label.builder().labelId(1).label("  ").build())).isNull();
		assertThat(LabelView.viewOf(Label.builder().labelId(1).label(null).build())).isNull();
		assertThat(LabelView.viewOf(null)).isNull();
	}

	@Test
	void viewOfReturnsTheIdAndNameForANonBlankLabel() {
		LabelView view = LabelView.viewOf(Label.builder().labelId(1).label("work").build());

		assertThat(view.labelId()).isEqualTo(1);
		assertThat(view.name()).isEqualTo("work");
	}
}
